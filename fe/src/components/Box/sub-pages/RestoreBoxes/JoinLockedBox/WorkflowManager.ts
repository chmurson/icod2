import type {
  BasicProtoInterface,
  PeersMessageRouter,
  RouterItem,
} from "@/services/libp2p";

type EventPredicate<T = any> = (data: T) => boolean;
type EventHandler<T = any, TProto = BasicProtoInterface<T>> = (data: T, workflow: WorkflowDefinition<T>, proto: TProto) => void | Promise<void>;

interface WorkflowStep<T = any> {
  event: EventPredicate<T>;
  condition?: () => boolean;
  handler?: EventHandler<T>;
}

interface WorkflowDefinition<T = any> {
  name: string;
  steps: WorkflowStep<T>[];
  onComplete?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

interface WorkflowState {
  currentStepIndex: number;
  isActive: boolean;
  data: Record<string, any>;
}

export class WorkflowManager<
  TMessage extends Record<string, unknown> = Record<string, unknown>,
  TProto extends BasicProtoInterface<TMessage> = BasicProtoInterface<TMessage>,
> {
  private workflows: Map<string, WorkflowDefinition<TMessage>> = new Map();
  private workflowStates: Map<string, WorkflowState> = new Map();
  private eventBuffer: Array<{ peerId: string; message: TMessage }> = [];
  private isProcessing = false;
  private lastReferencedProto: TProto | undefined;
  readonly router: RouterItem<TMessage, TProto>;

  constructor(router?: PeersMessageRouter<TMessage, TProto>) {
    this.router = (peerId, message) => {
      this.handleIncomingMessage(peerId, message);
    };

    if (router) {
      this.attachToRouter(router);
    }
  }

  /**
   * Attach the workflow manager to a message router
   */
  attachToRouter(router: PeersMessageRouter<TMessage, TProto>) {
    // Create a universal handler that captures all messages
    router.addHandler((_msg): _msg is TMessage => true, (peerId, message, proto) => {
      this.lastReferencedProto = proto;
      this.handleIncomingMessage(peerId, message);
    });
  }

  /**
   * Define a new workflow
   */
  defineWorkflow(workflow: WorkflowDefinition<TMessage>): void {
    this.workflows.set(workflow.name, workflow);
    this.workflowStates.set(workflow.name, {
      currentStepIndex: 0,
      isActive: false,
      data: {},
    });
  }

  /**
   * Start a workflow
   */
  startWorkflow(name: string, initialData?: Record<string, any>): void {
    const workflow = this.workflows.get(name);
    if (!workflow) {
      throw new Error(`Workflow "${name}" not found`);
    }

    const state = this.workflowStates.get(name);
    if (!state) {
      throw new Error(`Workflow state for "${name}" not found`);
    }

    state.isActive = true;
    state.currentStepIndex = 0;
    state.data = { ...initialData };

    // Process any buffered events
    this.processEventBuffer();
  }

  /**
   * Stop a workflow
   */
  stopWorkflow(name: string): void {
    const state = this.workflowStates.get(name);
    if (state) {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.data = {};
    }
  }

  /**
   * Reset all workflows
   */
  reset(): void {
    this.workflowStates.forEach((state) => {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.data = {};
    });
    this.eventBuffer = [];
  }

  /**
   * Get workflow state
   */
  getWorkflowState(name: string): WorkflowState | undefined {
    return this.workflowStates.get(name);
  }

  /**
   * Update workflow data
   */
  updateWorkflowData(name: string, data: Record<string, any>): void {
    const state = this.workflowStates.get(name);
    if (state) {
      state.data = { ...state.data, ...data };
    }
  }

  /**
   * Handle incoming messages from router
   */
  private handleIncomingMessage(peerId: string, message: TMessage): void {
    // Buffer the event
    this.eventBuffer.push({ peerId, message });

    // Process if not already processing
    if (!this.isProcessing) {
      this.processEventBuffer();
    }
  }

  /**
   * Process buffered events
   */
  private async processEventBuffer(): Promise<void> {
    if (this.isProcessing || this.eventBuffer.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.eventBuffer.length > 0) {
      const event = this.eventBuffer.shift();
      if (!event) continue;

      await this.processEvent(event.peerId, event.message);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single event against all active workflows
   */
  private async processEvent(peerId: string, message: TMessage): Promise<void> {
    for (const [workflowName, workflow] of this.workflows.entries()) {
      const state = this.workflowStates.get(workflowName);
      if (!state || !state.isActive) continue;

      const currentStep = workflow.steps[state.currentStepIndex];
      if (!currentStep) continue;

      try {
        if (!currentStep.event(message)) continue;

        if (currentStep.condition && !currentStep.condition()) continue;

        state.data._lastPeerId = peerId;
        state.data._lastMessage = message;

        if (currentStep.handler) {
          await currentStep.handler(message, workflow, this.lastReferencedProto!);
        }

        state.currentStepIndex++;

        if (state.currentStepIndex >= workflow.steps.length) {
          state.isActive = false;
          state.currentStepIndex = 0;
        }
      } catch (error) {
        if (workflow.onError) {
          workflow.onError(error as Error);
        }

        state.isActive = false;
        state.currentStepIndex = 0;
        state.data = {};
      }
    }
  }

}

/**
 * Helper class for building workflows with a fluent API
 */
export class WorkflowBuilder<
  TMessage extends Record<string, unknown> = Record<string, unknown>,
> {
  private workflow: Partial<WorkflowDefinition<TMessage>> = {
    steps: [],
  };

  constructor(name: string) {
    this.workflow.name = name;
  }

  /**
   * Add a step that waits for an event
   */
  waitFor<TSpecificMessage extends TMessage>(
    event: EventPredicate<TSpecificMessage>,
    handler?: EventHandler<TSpecificMessage>,
  ): WorkflowBuilder<TMessage> {
    this.workflow.steps!.push({
      event: event as EventPredicate<TMessage>,
      handler: handler as EventHandler<TMessage> | undefined,
    });
    return this;
  }

  /**
   * Add a step with a condition
   */
  waitForWithCondition<TSpecificMessage extends TMessage>(
    event: EventPredicate<TSpecificMessage>,
    condition: () => boolean,
    handler?: EventHandler<TSpecificMessage>,
  ): WorkflowBuilder<TMessage> {
    this.workflow.steps!.push({
      event: event as EventPredicate<TMessage>,
      condition,
      handler: handler as EventHandler<TMessage> | undefined,
    });
    return this;
  }

  /**
   * Set error handler
   */
  onError(handler: (error: Error) => void): WorkflowBuilder<TMessage> {
    this.workflow.onError = handler;
    return this;
  }

  public build(): WorkflowDefinition<TMessage> {
    return this.workflow as WorkflowDefinition<TMessage>;
  }
}

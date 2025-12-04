import type { BasicProtoInterface, RouterItem } from "@/services/libp2p";
import type { WorkflowDefinition, WorkflowState } from "./types";

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

  constructor() {
    this.router = (peerId, message, proto) => {
      this.lastReferencedProto = proto;
      this.handleIncomingMessage(peerId, message);
    };
  }

  defineWorkflow(workflow: WorkflowDefinition<TMessage>): void {
    this.workflows.set(workflow.name, workflow);
    this.workflowStates.set(workflow.name, {
      currentStepIndex: 0,
      isActive: false,
      data: {},
    });
  }

  startWorkflow(name: string, initialData?: Record<string, unknown>): void {
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

    this.processEventBuffer();
  }

  startAllWorkflows(): void {
    this.workflowStates.forEach((state, name) => {
      if (!state.isActive) {
        this.startWorkflow(name);
      }
    });
  }

  stopWorkflow(name: string): void {
    const state = this.workflowStates.get(name);
    if (state) {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.data = {};
    }
  }

  reset(): void {
    this.workflowStates.forEach((state) => {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.data = {};
    });
    this.eventBuffer = [];
  }

  getWorkflowState(name: string): WorkflowState | undefined {
    return this.workflowStates.get(name);
  }

  updateWorkflowData(name: string, data: Record<string, unknown>): void {
    const state = this.workflowStates.get(name);
    if (state) {
      state.data = { ...state.data, ...data };
    }
  }

  private handleIncomingMessage(peerId: string, message: TMessage): void {
    this.eventBuffer.push({ peerId, message });

    if (!this.isProcessing) {
      this.processEventBuffer();
    }
  }

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
          await currentStep.handler(
            message,
            workflow,
            // biome-ignore lint/style/noNonNullAssertion: I'm positive it will always be not null
            this.lastReferencedProto!,
          );
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

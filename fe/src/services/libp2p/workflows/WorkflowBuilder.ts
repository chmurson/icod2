import type { EventHandler, EventPredicate, WorkflowDefinition } from "./types";

export class WorkflowBuilder<
  TMessage extends Record<string, unknown> = Record<string, unknown>,
> {
  private workflow: Pick<WorkflowDefinition<TMessage>, "steps"> &
    Partial<Omit<WorkflowDefinition<TMessage>, "steps">> = {
    steps: [],
  };

  constructor(name: string) {
    this.workflow.name = name;
  }

  waitFor<TSpecificMessage extends TMessage>(
    event: EventPredicate<TSpecificMessage>,
    handler?: EventHandler<TSpecificMessage>,
  ): WorkflowBuilder<TMessage> {
    this.workflow.steps.push({
      event: event as EventPredicate<TMessage>,
      handler: handler as EventHandler<TMessage> | undefined,
    });
    return this;
  }

  waitForWithCondition<TSpecificMessage extends TMessage>(
    event: EventPredicate<TSpecificMessage>,
    condition: () => boolean,
    handler?: EventHandler<TSpecificMessage>,
  ): WorkflowBuilder<TMessage> {
    this.workflow.steps.push({
      event: event as EventPredicate<TMessage>,
      condition,
      handler: handler as EventHandler<TMessage> | undefined,
    });
    return this;
  }

  onError(handler: (error: Error) => void): WorkflowBuilder<TMessage> {
    this.workflow.onError = handler;
    return this;
  }

  public build(): WorkflowDefinition<TMessage> {
    return this.workflow as WorkflowDefinition<TMessage>;
  }
}

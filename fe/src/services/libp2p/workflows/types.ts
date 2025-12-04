import type { BasicProtoInterface } from "../types";

export type EventPredicate<T = unknown> = (data: T) => boolean;
export type EventHandler<T = unknown, TProto = BasicProtoInterface<T>> = (
  data: T,
  workflow: WorkflowDefinition<T>,
  proto: TProto,
) => void | Promise<void>;

export interface WorkflowStep<T = unknown> {
  event: EventPredicate<T>;
  condition?: () => boolean;
  handler?: EventHandler<T>;
}

export interface WorkflowDefinition<T = unknown> {
  name: string;
  steps: WorkflowStep<T>[];
  onComplete?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

export interface WorkflowState {
  currentStepIndex: number;
  isActive: boolean;
  data: Record<string, unknown>;
}

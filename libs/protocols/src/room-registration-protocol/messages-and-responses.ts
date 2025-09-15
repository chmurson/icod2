import z from "zod";

export const messagesSchemas = {
  registerRoom: z.object({
    type: z.literal("register-room"),
    roomName: z.string().min(1).max(100),
  }),
  unregisterRoom: z.object({
    type: z.literal("unregister-room"),
    roomName: z.string().min(1).max(100),
  }),
};

export type Messages = {
  registerRoom: z.infer<typeof messagesSchemas.registerRoom>;
  unregisterRoom: z.infer<typeof messagesSchemas.unregisterRoom>;
};

export type Responses = {
  registerRoomSuccess: z.infer<typeof responseSchemas.registerRoomSuccess>;
  registerRoomError: z.infer<typeof responseSchemas.registerRoomError>;
  unregisterRoomSuccess: z.infer<typeof responseSchemas.unregisterRoomSuccess>;
};

export const responseSchemas = {
  registerRoomSuccess: z.object({
    type: z.literal("register-room-response-success"),
    roomName: z.string(),
  }),
  registerRoomError: z.object({
    type: z.literal("register-room-response-error"),
    roomName: z.string(),
    error: z.string(),
  }),
  unregisterRoomSuccess: z.object({
    type: z.literal("unregister-room-response-success"),
    roomName: z.string(),
  }),
};

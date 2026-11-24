import { type Static, Type } from "typebox";

export const Item = Type.Object({
  name: Type.String(),
});

export type ItemType = Static<typeof Item>;

import { z } from 'zod';

import { serverDB } from '@/database/server';
import { SessionGroupModel } from '@/database/server/models/sessionGroup';
import { insertSessionGroupSchema } from '@/database/server/schemas/lobechat';
import { authedProcedure, router } from '@/libs/trpc';
import { SessionGroupItem } from '@/types/session';

const sessionProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      sessionGroupModel: new SessionGroupModel(serverDB, ctx.userId),
    },
  });
});

export const sessionGroupRouter = router({
  createSessionGroup: sessionProcedure
    .input(
      z.object({
        name: z.string(),
        sort: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionGroupModel.create({
        name: input.name,
        sort: input.sort,
      });

      return data?.id;
    }),

  getSessionGroup: sessionProcedure.query(async ({ ctx }): Promise<SessionGroupItem[]> => {
    return ctx.sessionGroupModel.query() as any;
  }),

  removeAllSessionGroups: sessionProcedure.mutation(async ({ ctx }) => {
    return ctx.sessionGroupModel.deleteAll();
  }),

  removeSessionGroup: sessionProcedure
    .input(z.object({ id: z.string(), removeChildren: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.sessionGroupModel.delete(input.id);
    }),

  updateSessionGroup: sessionProcedure
    .input(
      z.object({
        id: z.string(),
        value: insertSessionGroupSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.sessionGroupModel.update(input.id, input.value);
    }),
  updateSessionGroupOrder: sessionProcedure
    .input(
      z.object({
        sortMap: z.array(
          z.object({
            id: z.string(),
            sort: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log('sortMap:', input.sortMap);

      return ctx.sessionGroupModel.updateOrder(input.sortMap);
    }),
});

export type SessionGroupRouter = typeof sessionGroupRouter;

export function errorMiddleware() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error(err);
      ctx.status = err.status || 500;

      if (err.name === 'ValidationError' && err.details) {
        ctx.body = err.details;
      } else if (err.data) {
        ctx.body = err.data;
      } else {
        ctx.body = err.message;
      }

      ctx.app.emit('error', err, ctx);
    }
  };
}

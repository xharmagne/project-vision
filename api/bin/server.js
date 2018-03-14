import Koa from 'koa';
import body from 'koa-better-body';
import convert from 'koa-convert';
import logger from 'koa-logger';
import passport from 'koa-passport';
import mount from 'koa-mount';
import serve from 'koa-static';
import cors from 'kcors';

import config from '../config';
import { errorMiddleware } from '../src/middleware';
import validate from 'koa-validate';
import { getLatestEvents } from '../src/services/austrackService';

setInterval(getLatestEvents, config.eventsInterval);

const app = new Koa();

const corsOriginRegex = new RegExp(config.corsOriginRegex);
app.use(
  cors({
    origin: function(req) {
      if (req.headers.origin && req.headers.origin.match(corsOriginRegex)) {
        return req.headers.origin;
      }
      return null;
    },
  })
);

app.use(convert(logger()));
app.use(errorMiddleware());
app.use(
  convert(
    body({
      fields: 'body', // Simulate same behaviour as koa-bodyparser
      jsonLimit: 52428800,
    })
  )
);
app.use(convert(mount('/docs', serve(`${process.cwd()}/build/docs`))));
app.use(convert(mount('/', serve(`${process.cwd()}/static`))));

require('../config/passport');
app.use(passport.initialize());
validate(app);

const modules = require('../src/modules');
modules(app);

app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`);
});

export default app;

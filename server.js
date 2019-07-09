import path from 'path';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import _ from 'underscore';
import { initPlugin } from './lib/server/index';
// import objectql from '@steedos/objectql';
const objectql = require("@steedos/objectql");

let objectsDir = path.resolve('./objects')
let reportsDir = path.resolve('./reports')
objectql.getSteedosSchema().addDataSource('default', {
    driver: 'mongo',
    // url: 'mongodb://192.168.0.77/qhd-beta',
    url: 'mongodb://192.168.0.21/fssh20190329',
    objectFiles: [objectsDir],
    reportFiles: [reportsDir]
});

let app = express();

app.use(function (req, res, next) {
    //TODO 处理userId
    next();
});

_.each(objectql.getSteedosSchema().getDataSources(), function (datasource, name) {
    app.use(`/graphql/${name}`, graphqlHTTP({
        schema: datasource.buildGraphQLSchema(),
        graphiql: true
    }));
})

const port = 3200;
process.env.PORT = port;
process.env.ROOT_URL = "http://localhost:3200";

initPlugin(app);

app.listen(process.env.PORT || 3000, function (error) {
    if (error) {
        console.error(error)
    } else {
        console.info('==> Listening on port %s. Open up http://localhost:%s/plugins/stimulsoft/web in your browser.', port, port)
    }
});





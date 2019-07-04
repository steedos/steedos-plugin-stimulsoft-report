import path from 'path';
import express from 'express';
import reporter from './reporter';
import { getMrtContent, saveReportToMrtFile } from './mrt';
import requestHandler from './requestHandler';
import bodyParser from 'body-parser';
const objectql = require("@steedos/objectql");

const routes = express();
const rootUrl = "/plugins/stimulsoft";
const apiUrl = `${rootUrl}/api`;
const stimulsoftAssets = path.join(path.dirname(require.resolve("@steedos/stimulsoft-report")), "assets");

routes.use(bodyParser.json());

// 获取报表模板
routes.get(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let datasource = objectql.getSteedosSchema().getDataSource();
  let report = datasource.getReport(report_id);
  let mrtContent = getMrtContent(report);
  res.send(mrtContent);
});

// 报表mrt模板保存
routes.post(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let datasource = objectql.getSteedosSchema().getDataSource();
  let report = datasource.getReport(report_id).toConfig();
  saveReportToMrtFile(report.mrt_file, req.body);
  res.send({});
});

// 获取报表数据
routes.get(`${apiUrl}/data/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let datasource = objectql.getSteedosSchema().getDataSource();
  let report = datasource.getReport(report_id);
  let data = await reporter.getData(report);
  res.send(data);
});

// 获取报表列表
routes.get(`${apiUrl}/reports`, async (req, res) => {
  let datasource = objectql.getSteedosSchema().getDataSource();
  let report = datasource.getReportsConfig();
  res.send(report);
});

routes.get(`${rootUrl}/web/designer/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  res.redirect(301, `${rootUrl}/assets/designer.html?reportUrl=${rootUrl}/api/mrt/${report_id}`);
  res.end();
});

routes.get(`${rootUrl}/web/viewer/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  res.redirect(301, `${rootUrl}/assets/viewer.html?reportUrl=${rootUrl}/api/mrt/${report_id}`);
  res.end();
});

routes.use(rootUrl, requestHandler);

routes.use(rootUrl, express.static(path.resolve('build')));
routes.use(rootUrl, express.static(path.resolve('public')));

export default routes;

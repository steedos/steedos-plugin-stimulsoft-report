import path from 'path';
import express from 'express';
import reporter from './reporter';
import { getMrtContent, saveReportToMrtFile } from './mrt';
import requestHandler from './requestHandler';
import bodyParser from 'body-parser';
import { getReportsConfig, getReport } from './index';

const routes = express();
const rootUrl = "/plugins/stimulsoft";
const apiUrl = `${rootUrl}/api`;

routes.use(bodyParser.json());

// 获取报表模板
routes.get(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let report = getReport(report_id);
  let mrtContent = getMrtContent(report);
  res.send(mrtContent);
});

// 报表mrt模板保存
routes.post(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let report = getReport(report_id).toConfig();
  saveReportToMrtFile(report.mrt_file, req.body);
  res.send({});
});

// 获取报表数据
routes.get(`${apiUrl}/data/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let report = getReport(report_id);
  let data = await reporter.getData(report);
  res.send(data);
});

// 获取报表列表
routes.get(`${apiUrl}/reports`, async (req, res) => {
  let reports = getReportsConfig();
  res.send(reports);
});

// 报表设计器WEB界面重定向到相关静态html界面
routes.get(`${rootUrl}/web/designer/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  res.redirect(301, `${rootUrl}/assets/designer.html?reportUrl=${rootUrl}/api/mrt/${report_id}`);
  res.end();
});

// 报表查看WEB界面重定向到相关静态html界面
routes.get(`${rootUrl}/web/viewer/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  res.redirect(301, `${rootUrl}/assets/viewer.html?reportUrl=${rootUrl}/api/mrt/${report_id}`);
  res.end();
});

routes.use(rootUrl, requestHandler);

routes.use(rootUrl, express.static(path.resolve('build')));

export default routes;

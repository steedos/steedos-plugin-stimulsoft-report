import path from 'path';
import express from 'express';
import { getMrtContent, getBlankMrtContent, saveReportToMrtFile, getMrtDictionary } from './mrt';
import requestHandler from './requestHandler';
import bodyParser from 'body-parser';
import { getReportsConfig, getReport } from './index';
import { setRequestUser } from '@steedos/auth';
import { SteedosReport } from './report';
import { getObject } from './utils';

const routes = express();
const rootUrl = "/plugins/stimulsoft";
const apiUrl = `${rootUrl}/api`;

routes.use(bodyParser.json());

routes.use([`${rootUrl}/web`, `${rootUrl}/api`], setRequestUser);

routes.use([`${rootUrl}/web`, `${rootUrl}/api`], function (req, res, next) {
  if (req.user) {
    if (!req.user.spaceId) {
      res.status(401).send({ status: 'error', message: 'You must pass the params space_id.' });
      return;
    }
    next();
  } else {
    res.status(401).send({ status: 'error', message: 'You must be logged in to do this.' });
  }
});

// 获取报表模板
routes.get(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let report = getReport(report_id);
  let mrtContent = getMrtContent(report);
  // 因Dictionary.Databases中PathData属性依赖了user_filters，所以每次都应该重新生成Dictionary值
  mrtContent.Dictionary = getMrtDictionary(report, user_filters);
  res.send(mrtContent);
});

// 获取db中的报表模板
routes.get(`${apiUrl}/mrt_db/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let reportObject = getObject("reports");
  let reportConfig = await reportObject.findOne(report_id);
  if (!reportConfig) {
    res.status(404).send(`<b style="color:red">未找到报表:${report_id}</b>`);
    res.end();
    return;
  }
  let mrtContent = reportConfig.mrt;
  if(!mrtContent){
    mrtContent = getBlankMrtContent(reportConfig, user_filters, true);
  }
  else{
    mrtContent = JSON.parse(mrtContent);
    // 因报表指向的object可能有变更，所以每次都自动再获取一次相关配置
    mrtContent.Dictionary = getMrtDictionary(reportConfig, user_filters, true);
  }
  res.send(mrtContent);
});

// 报表mrt模板保存
routes.post(`${apiUrl}/mrt/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let report = getReport(report_id).toConfig();
  saveReportToMrtFile(report.mrt_file, req.body);
  res.send({});
});

// 报表mrt模板保存到数据库
routes.post(`${apiUrl}/mrt_db/:report_id`, async (req, res) => {
  let report_id = req.params.report_id;
  let reportObject = getObject("reports");
  let result = await reportObject.updateOne(report_id, { mrt: JSON.stringify(req.body)}, req.user);
  if (!result) {
    res.status(404).send(`<b style="color:red">报表保存失败！</b>`);
    res.end();
    return;
  }
  res.send({});
});

// 获取报表数据，报表来自于yml配置文件
routes.get(`${apiUrl}/data/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  if (user_filters) {
    user_filters = JSON.parse(decodeURIComponent(user_filters));
  }
  let report_id = req.params.report_id;
  let report = getReport(report_id);
  if (!report) {
    res.status(404).send(`<b style="color:red">未找到报表:${report_id}</b>`);
    res.end();
    return;
  }
  let missingRequiredFilters = report.getMissingRequiredFilters(user_filters)
  if (missingRequiredFilters && missingRequiredFilters.length) {
    res.status(500).send(`<b style="color:red">缺少过滤条件：${JSON.stringify(missingRequiredFilters)}</b>`);
    res.end();
    return;
  }
  let data = await report.getData(user_filters, req.user);
  res.send(data);
});

// 获取报表数据，报表来自于数据库
routes.get(`${apiUrl}/data_db/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  if (user_filters) {
    user_filters = JSON.parse(decodeURIComponent(user_filters));
  }
  let report_id = req.params.report_id;
  let reportObject = getObject("reports");
  let reportConfig = await reportObject.findOne(report_id);
  if (!reportConfig) {
    res.status(404).send(`<b style="color:red">未找到报表:${report_id}</b>`);
    res.end();
    return;
  }
  let report = new SteedosReport(reportConfig);
  let missingRequiredFilters = report.getMissingRequiredFilters(user_filters)
  if (missingRequiredFilters && missingRequiredFilters.length) {
    res.status(500).send(`<b style="color:red">缺少过滤条件：${JSON.stringify(missingRequiredFilters)}</b>`);
    res.end();
    return;
  }
  let data = await report.getData(user_filters, req.user);
  res.send(data);
});

// 获取报表列表
routes.get(`${apiUrl}/reports`, async (req, res) => {
  let reports = getReportsConfig();
  res.send(reports);
});

// 报表设计器WEB界面重定向到相关静态html界面，报表来自于yml配置文件
routes.get(`${rootUrl}/web/designer/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let reportUrl = `${rootUrl}/api/mrt/${report_id}`;
  if(user_filters){
    reportUrl += `?user_filters=${user_filters}`;
  }
  reportUrl = encodeURIComponent(reportUrl);
  let url = `${rootUrl}/assets/designer.html?reportUrl=${reportUrl}`;
  res.redirect(301, url);
  res.end();
});

// 报表设计器WEB界面重定向到相关静态html界面，报表来自于数据库
routes.get(`${rootUrl}/web/designer_db/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let reportUrl = `${rootUrl}/api/mrt_db/${report_id}`;
  if(user_filters){
    reportUrl += `?user_filters=${user_filters}`;
  }
  reportUrl = encodeURIComponent(reportUrl);
  let url = `${rootUrl}/assets/designer.html?reportUrl=${reportUrl}`;
  res.redirect(301, url);
  res.end();
});

// 报表查看WEB界面重定向到相关静态html界面，报表来自于yml配置文件
routes.get(`${rootUrl}/web/viewer/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let reportUrl = `${rootUrl}/api/mrt/${report_id}`;
  if(user_filters){
    reportUrl += `?user_filters=${user_filters}`;
  }
  reportUrl = encodeURIComponent(reportUrl);
  let url = `${rootUrl}/assets/viewer.html?reportUrl=${reportUrl}`;
  res.redirect(301, url);
  res.end();
});

// 报表查看WEB界面重定向到相关静态html界面，报表来自于数据库
routes.get(`${rootUrl}/web/viewer_db/:report_id`, async (req, res) => {
  let { user_filters, ...query } = req.query;
  let report_id = req.params.report_id;
  let reportUrl = `${rootUrl}/api/mrt_db/${report_id}`;
  if(user_filters){
    reportUrl += `?user_filters=${user_filters}`;
  }
  reportUrl = encodeURIComponent(reportUrl);
  let url = `${rootUrl}/assets/viewer.html?reportUrl=${reportUrl}`;
  res.redirect(301, url);
  res.end();
});

routes.use(rootUrl, requestHandler);

routes.use(rootUrl, express.static(path.resolve(__dirname, "../build")));

export default routes;

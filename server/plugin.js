import _ from 'underscore';
import path from 'path';
import { loadReports } from './utils';
import { SteedosReport } from './report';
import appRoot from 'app-root-path';
import { initMrts } from './mrt';
import { default as routes } from './router';

export default class SteedosPlugin { 
    _reports = {}

    constructor(config) {
        if (config && config.reportFiles){
            this.useReportFiles(config.reportFiles);
        }
    }

    init({ app }){
        let reportsDir = appRoot.resolve('/src');
        this.useReportFiles([reportsDir]);
        initMrts(this.getReports());

        app.use(routes);
    }

    get reports() {
        return this._reports;
    }

    getReports(){
        return this._reports;
    }

    getReportsConfig() {
        let reportsConfig = {}
        _.each(this._reports, (report, _id) => {
            reportsConfig[_id] = report.toConfig()
        })
        return reportsConfig
    }

    getReport(id) {
        return this._reports[id];
    }

    useReportFiles(reportFiles) {
        reportFiles.forEach((reportFile)=>{
            this.useReportFile(reportFile)
        });
    }

    useReportFile(filePath) {
        let reportJsons = loadReports(filePath)
        _.each(reportJsons, (json) => {
            if (json.report_type === "stimulsoft-report") {
                json.mrt_file = path.join(filePath, `${json._id}.mrt`)
                this.addReport(json._id, json)
            }
        })
    }

    addReport(report_id, config) {
        config._id = report_id
        this._reports[config._id] = new SteedosReport(config)
    }
}


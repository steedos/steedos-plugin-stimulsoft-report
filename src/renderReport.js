import fetch from 'cross-fetch';

export function renderDesigner(reportId) {
    let options = new window.Stimulsoft.Designer.StiDesignerOptions();
    options.appearance.fullScreenMode = false;
    let designer = new window.Stimulsoft.Designer.StiDesigner(options, 'StiDesigner', false);
    let report = new window.Stimulsoft.Report.StiReport();
    report.loadFile(`/plugins/stimulsoft/api/mrt/${reportId}`);
    designer.report = report;
    designer.renderHtml("report-designer");
    designer.onSaveReport = async function (args) {
        // 保存报表模板
        let jsonReport = args.report.saveToJsonString();
        let response = await fetch(`/plugins/stimulsoft/api/mrt/${reportId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonReport
        });
        if (!response.ok) {
            window.Stimulsoft.System.StiError.showError("保存失败", true);
        }
    }
    if (!report.getDictionary().dataSources.count) {
        window.Stimulsoft.System.StiError.showError("未找到报表", true);
    }
}

export function renderViewer(reportId) {
    let viewer = new window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
    let report = new window.Stimulsoft.Report.StiReport();
    report.loadFile(`/plugins/stimulsoft/api/mrt/${reportId}`);
    viewer.report = report;
    viewer.renderHtml("report-viewer");
    if (!report.getDictionary().dataSources.count) {
        window.Stimulsoft.System.StiError.showError("未找到报表", true);
    }
}

export default (reportId, isDesigner) => {
    if (isDesigner){
        renderDesigner(reportId);
    }
    else{
        renderViewer(reportId);
    }
}
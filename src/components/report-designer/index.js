import React, { Component } from 'react';
import renderReport from '../../renderReport';


class ReportDesigner extends Component {
    render() {
        return <div id="report-designer"></div>;
    }

    componentDidMount(){
        let reportId = this.props.match.params.id;
        renderReport(reportId, true);
    }
}


export default ReportDesigner;

import React, { Component } from 'react';
import renderReport from '../../renderReport';

class ReportViewer extends Component {
    render() {
        return <div id="report-viewer"></div>;
    }          

    componentDidMount(){
        let reportId = this.props.match.params.id;
        renderReport(reportId);
    }
}


export default ReportViewer;

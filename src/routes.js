import ReportList from './components/report-list';
import ReportDesigner from './components/report-designer';
import ReportViewer from './components/report-viewer';
import NotFound from './components/not-found';

import loadData from './helpers/load-data';

const Routes = [
    {
        path: '/web/',
        exact: true,
        component: ReportList,
        loadData: () => loadData('reports', true)
    },
    {
        path: '/web/designer/:id',
        exact: true,
        component: ReportDesigner,
        isReport: true,
        isReportDesigner: true
    },
    {
        path: '/web/viewer/:id',
        exact: true,
        component: ReportViewer,
        isReport: true
    },
    {
        component: NotFound
    }
];

export default Routes;
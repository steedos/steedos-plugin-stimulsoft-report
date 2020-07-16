import ReportList from './components/report-list';
import NotFound from './components/not-found';

import loadData from './helpers/load-data';

const Routes = [
    {
        path: '/web/',
        exact: true,
        component: ReportList,
        loadData: (match, userSession) => loadData('reports', true, userSession)
    },
    {
        component: NotFound
    }
];

export default Routes;
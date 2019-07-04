import ReportList from './components/report-list';
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
        component: NotFound
    }
];

export default Routes;
import _ from 'underscore';
import { default as SteedosPlugin } from './plugin';
const plugin = new SteedosPlugin();

export function initPlugin(context){
    return plugin.init(context);
}

export function getReports() {
    return plugin.getReports();
}

export function getReportsConfig() {
    return plugin.getReportsConfig();
}

export function getReport(id) {
    return plugin.getReport(id);
}

export { default as routes } from './router';
export * from './mrt';
export { initPlugin as init }
export default plugin;

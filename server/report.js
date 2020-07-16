import { graphql } from 'graphql';
const objectql = require("@steedos/objectql");
const { formatFiltersToGraphqlQuery } = require("@steedos/filters");
export class SteedosReport {
    constructor(config) {
        this._id = config._id
        this.name = config.name
        this.object_name = config.object_name
        this.fields = config.fields
        this.filters = config.filters
        this.description = config.description
        this.mrt_file = config.mrt_file
        this.graphql = config.graphql
        this.mrt = config.mrt
    }

    toConfig() {
        let config = {}
        config._id = this._id
        config.name = this.name
        config.object_name = this.object_name
        config.fields = this.fields
        config.filters = this.filters
        config.description = this.description
        config.mrt_file = this.mrt_file
        config.graphql = this.graphql
        return config
    }

    getRequiredFilters() {
        // 找到过滤条件中必填且值未设置的选项
        if (this.filters && this.filters.length) {
            return this.filters.filter((item) => {
                return item.is_required && (item.value === undefined || item.value === null);
            });
        }
        else {
            return [];
        }
    }

    getMissingRequiredFilters(user_filters) {
        // 检查user_filters中是否有缺失的必要过滤条件
        let requiredFilters = this.getRequiredFilters();
        if (requiredFilters.length) {
            if (user_filters && user_filters.length) {
                if (typeof user_filters[0] === "string") {
                    // 如果只有一层，即user_filters值格式为：["HPK_PAYBILL","=","1001B21000000002ETKD"]
                    user_filters = [user_filters];
                }
                return requiredFilters.filter((item) => {
                    return !user_filters.find((userFilter) => {
                        if (userFilter.field) {
                            // 非数组格式
                            return userFilter.field === item.field && userFilter.value !== undefined && userFilter.value !== null
                        }
                        else {
                            // 数组格式
                            return userFilter[0] === item.field && userFilter[2] !== undefined && userFilter[2] !== null
                        }
                    })
                });
            }
            else {
                return requiredFilters;
            }
        }
        else {
            return [];
        }
    }

    async getData(user_filters, user_session) {
        let schema = objectql.getSteedosSchema().getDataSource().getGraphQLSchema();
        // let graphqlQuery = this.graphql;
        let graphqlQuery = ""; //先不支持配置graphql，因为配置后无法带上space
        if (!graphqlQuery) {
            let filters = [];
            if (this.filters) {
                filters = this.filters;
            }
            if (user_filters && user_filters.length) {
                if (filters.length) {
                    filters = [filters, "and", user_filters]
                }
                else {
                    filters = user_filters;
                }
            }
            if(filters && filters.length){
                filters = [filters, "and", ["space", "=", user_session.spaceId]];
            }
            else{
                filters = [["space", "=", user_session.spaceId]]
            }
            graphqlQuery = formatFiltersToGraphqlQuery(filters, this.fields, user_session);
        }
        let dataResult = await graphql(schema, graphqlQuery);
        dataResult = dataResult['data'];
        let items = dataResult ? dataResult[`${this.object_name}`] : null;
        if (items && items.length) {
            let processChildren = (item, parentKey, object) => {
                /**
                 把{
                    "object_name": [{
                    "_id": "R9HquKmR5fHbDqdWq",
                    "name": "测试1",
                    "organization": {
                        "_id": "P7XMJMjKoSz4yaK49",
                        "name": "组织A"
                    }
                    }]
                }
                中的organization转成 "organization._id", "organization.name"，
                转换后结果： {
                    "object_name": [{
                    "_id": "R9HquKmR5fHbDqdWq",
                    "name": "测试1",
                    "organization": {
                        "_id": "P7XMJMjKoSz4yaK49",
                        "name": "组织A"
                    },
                    "organization._id": "P7XMJMjKoSz4yaK49",
                    "organization.name": "组织A"
                    }]
                }
                支持无限层递归
                */
                for (let k in object) {
                    let childKey = `${parentKey}.${k}`;
                    let childValue = object[k];
                    if (typeof childValue === "object") {
                        processChildren(item, childKey, childValue);
                    }
                    else {
                        item[childKey] = childValue;
                    }
                }
            }
            items.forEach((item) => {
                for (let k in item) {
                    if (typeof item[k] === "object") {
                        processChildren(item, k, item[k]);
                    }
                }
            });
        }
        return dataResult;
        // else {
        //   let object = getObject(this.object_name);
        //   let dataResult = await object.find({
        //     fields: this.fields,
        //     filters: this.filters
        //   });
        //   let result = {};
        //   result[`${this.object_name}`] = dataResult;
        //   return result;
        // }
    }
}


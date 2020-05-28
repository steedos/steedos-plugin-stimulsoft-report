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
        else{
            return [];
        }
    }

    getMissingRequiredFilters(user_filters) {
        // 检查user_filters中是否有缺失的必要过滤条件
        let requiredFilters = this.getRequiredFilters();
        if (requiredFilters.length) {
            if (user_filters && user_filters.length) {
                if (typeof user_filters[0] === "string"){
                    // 如果只有一层，即user_filters值格式为：["HPK_PAYBILL","=","1001B21000000002ETKD"]
                    user_filters = [user_filters];
                }
                return requiredFilters.filter((item)=>{
                    return !user_filters.find((userFilter)=>{
                        if (userFilter.field){
                            // 非数组格式
                            return userFilter.field === item.field && userFilter.value !== undefined && userFilter.value !== null
                        }
                        else{
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
        else{
            return [];
        }
    }
}


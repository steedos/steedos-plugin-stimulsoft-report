import _ from 'underscore';
const globby = require("globby");
const objectql = require('@steedos/objectql');
import path from 'path';

const loadFile = objectql.loadFile;

const getObject = (object_name)=> {
    return objectql.getSteedosSchema().getObject(object_name);
}

const getObjectConfig = (object_name)=> {
    return objectql.getObjectConfig(object_name);
}

const formatObjectFields = (report, objectConfig) => {
    let reportFields = report.fields;
    let objectFields = objectConfig.fields;
    let tempField, tempFieldType, tempFieldAlias, result, index = 0,
        keys, prevKey, tempObjectConfig, tempReferenceTo;
    result = {};
    if (reportFields && reportFields.length) {
        reportFields.forEach((key) => {
            keys = key.split(".");
            if (keys.length > 1) {
                // a.b或a.b.c的字段情况
                prevKey = null;
                tempFieldAlias = keys.map((k) => {
                    if (prevKey) {
                        tempReferenceTo = tempField.reference_to
                        if (!tempReferenceTo){
                            throw new Error(`can't find the reference_to property for the field ${prevKey} in the object ${objectConfig.name}`);
                        }
                        tempObjectConfig = getObjectConfig(tempReferenceTo);
                        tempField = tempObjectConfig.fields[k];
                        if (tempField) {
                            return tempField.label ? tempField.label : k;
                        } else {
                            throw new Error(`can't find the field ${k} in parent field ${prevKey} of the object ${objectConfig.name}`);
                        }
                    } else {
                        tempField = objectFields[k];
                        prevKey = k;
                        if (tempField) {
                            return tempField.label ? tempField.label : k;
                        } else {
                            throw new Error(`can't find the field:${objectConfig.name}.${k}`);
                        }
                    }
                }).join(".");
            }
            else {
                // 普通的不带.连接符的字段
                tempField = objectFields[key];
                if (tempField){
                    tempFieldAlias = tempField.label ? tempField.label : key;
                }
                else{
                    throw new Error(`can't find the field:${objectConfig.name}.${key}`);
                }
            }
            tempFieldType = convertFieldType(tempField);
            if (tempFieldType) {
                result[index] = {
                    "Name": key,
                    "Index": -1,
                    "NameInSource": key,
                    "Alias": tempFieldAlias,
                    "Type": tempFieldType
                };
                index++;
            }
        });
    }
    return result;
}

const convertFieldType = (tempField)=> {
    let type = tempField.type;
    if (!type) {
        return null;
    }
    if (tempField.multiple) {
        // 忽略所有数组字段类型
        return null;
    }
    let ignoreTypes = ["[text]", "[phone]", "password", "[Object]", "checkbox", "grid"];
    if (ignoreTypes.includes(type)) {
        // 忽略这些字段类型
        return null;
    }
    let defaultType = "System.String";
    switch (type) {
        case "date":
            return "System.DateTime"
        case "datetime":
            return "System.DateTime"
        case "currency":
            return "System.Double"
        case "number":
            return "System.Double"
        case "boolean":
            return "System.Boolean"
        case "filesize":
            return "System.Double"
        case "Object":
            return "System.Object"
        case "object":
            return "System.Object"
        case "location":
            return "System.Object"
        default:
            return defaultType
    }
}

const getDatabases = (report, isFromDb) => {
    if (!report) {
        return {};
    }
    const rootUrl = "/plugins/stimulsoft/api";
    let dataUrl = `${rootUrl}/data${isFromDb ? "_db" : ""}/${report._id}`;
    return {
        "0": {
            "Ident": "StiJsonDatabase",
            "Name": report.name,
            "Alias": report.name,
            "PathData": dataUrl
        }
    };
}

const getDataSources = (report, isFromDb)=> {
    if (!report) {
        return {};
    }
    let objectConfig = getObjectConfig(report.object_name);
    let columns = formatObjectFields(report, objectConfig);
    return {
        "0": {
            "Ident": "StiDataTableSource",
            "Name": objectConfig.name,
            "Alias": objectConfig.label,
            "Columns": columns,
            "NameInSource": `${report.name}.${objectConfig.name}`
        }
    };
}

const loadReports = (filePath) => {
    let results = [];
    const filePatten = [
        path.join(filePath, "*.report.yml"),
        path.join(filePath, "*.report.json"),
        path.join(filePath, "*.report.js")
    ];
    const matchedPaths = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath) => {
        let json = loadFile(matchedPath);
        results.push(json);
    });
    return results;
}

export { getObject, getObjectConfig, getDatabases, getDataSources, loadReports };

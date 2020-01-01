import React from 'react'
import { Table } from 'antd'

const MetricTable = ({ metrics, header }) => {
    const keyNames = [
        "name", "wmc", "dit", "noc", "cbo", "rfc", "lcom", "ca", "ce", "npm", "lcom3", "lco", "dam", "moa", "mfa", "cam", "ic", "cbm", "amc", "max_cc", "avg_cc", "bug"
    ]
    const columns = keyNames.map((t) => {
        let column = {
            title: t.toUpperCase(),
            width: 100,
            dataIndex: t,
            key: t,
        }

        if (t == "name") {
            column = {
                ...column,
                fixed: "left",
            }
        } else if (t == "bug") {
            column = {
                ...column,
                fixed: "right",
            }
        }

        return column
    });
    const data = metrics.map((m, id) => {
        return {
            ...m,
            key: id
        }
    });

    return (
        <Table 
            columns={columns}
            dataSource={data}
            scroll={{ x: '100vw', y: 'calc(100vh - 4em)' }}
            bordered
            pagination={false}
            title={header}
        />
    )
}

export default MetricTable
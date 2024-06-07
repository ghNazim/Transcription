import React from "react";
import "./DataTable.css";


const DataTable = ({ data }) => {
    const timestamps = Object.keys(data[0]).length===3;
  return (
    <table className="data-table">
      <thead>
        <tr>
          {timestamps && <th>Start</th>}
          {timestamps && <th>End</th>}
          <th>Text</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {timestamps && <td>{item.start}</td>}
            {timestamps && <td>{item.end}</td>}
            <td>{item.text}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};



export default DataTable;

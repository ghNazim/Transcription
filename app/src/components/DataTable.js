import React from "react";
import "./DataTable.css";


const DataTable = ({ data }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Text</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.start}</td>
            <td>{item.end}</td>
            <td>{item.text}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};



export default DataTable;

import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const columnDefs = [
    { headerName: 'ID', field: 'id' },
    { headerName: '품목명', field: 'itemName' },
];

const rowData = [
    { id: 1, itemName: '테스트1' },
    { id: 2, itemName: '테스트2' },
];

const AgGridTest = () => (
    <div style={{ width: 400, height: 300 }} className="ag-theme-alpine">
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
        />
    </div>
);

export default AgGridTest;

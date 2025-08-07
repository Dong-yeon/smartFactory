import React, {useEffect, useMemo, useRef} from "react";
import {RealGridReact} from "realgrid-react";
import * as RealGrid from "realgrid";

interface ItemGridProps {
    rowData: any[];
    gridViewRef: React.MutableRefObject<any>;
    dataProviderRef: React.MutableRefObject<any>;
    containerId: string;
}

const ProductProcessRevisionGrid: React.FC<ItemGridProps> = ({
                                                  rowData,
                                                  gridViewRef,
                                                  dataProviderRef,
                                                  containerId
                                              }) => {
    useEffect(() => {
        let rafId: number;
        let el = gridContainerRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            if (gridViewRef.current) {
                return;
            }
            rafId = window.requestAnimationFrame(() => {
                mountGridWhenReady();

            });
            return () => {
                window.cancelAnimationFrame(rafId);
            };
        }
    }, [rowData]);

    const mountGridWhenReady = () => {
        const el = gridContainerRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            if (!gridViewRef.current) {
                const fields = [
                    {fieldName: 'id', dataType: 'number'},
                    {fieldName: 'itemId', dataType: 'number'}, // Item FK
                    {fieldName: 'processId', dataType: 'number'}, // Process FK
                    {fieldName: 'processCode', dataType: 'text'}, // Process Code
                    {fieldName: 'processName', dataType: 'text'}, // Process Name
                    {fieldName: 'parent', dataType: 'object'}, // Parent ProductProcess FK
                    {fieldName: 'processOrder', dataType: 'number'}, // Process Order
                    {fieldName: 'processTime', dataType: 'number'}, // Process Time
                    {fieldName: 'revisionNo', dataType: 'number'}, // Revision No
                    {fieldName: 'isActive', dataType: 'boolean'}, // Is Active
                    {fieldName: 'createdAt', dataType: 'datetime'}, // Created At
                    {fieldName: 'updatedAt', dataType: 'datetime'}, // Updated At
                ];

                const columns = [
                    // {name: 'id', fieldName: 'id', header: 'ID', width: 60, editable: false},
                    // {name: 'itemId', fieldName: 'itemId', header: '품목ID', width: 80, editable: false},
                    // {name: 'processId', fieldName: 'processId', header: '공정ID', width: 80, editable: false},
                    // {name: 'processCode', fieldName: 'processCode', header: '공정코드', width: 100},
                    // {name: 'processName', fieldName: 'processName', header: '공정명', width: 120},
                    // {name: 'processOrder', fieldName: 'processOrder', header: '공정순서', width: 80},
                    // {name: 'processTime', fieldName: 'processTime', header: '공정시간', width: 80},
                    {name: 'revisionNo', fieldName: 'revisionNo', header: '리비전', width: 80},
                    // {name: 'isActive', fieldName: 'isActive', header: '사용여부', width: 80, renderer: { type: 'check', trueValues: 'true', falseValues: 'false' }},
                    // {name: 'createdAt', fieldName: 'createdAt', header: '생성일', width: 150, editable: false},
                    // {name: 'updatedAt', fieldName: 'updatedAt', header: '수정일', width: 150, editable: false},
                ];
                const dataProvider = new RealGrid.LocalDataProvider(true);
                dataProvider.setFields(fields);
                dataProvider.setRows(rowData);

                const gridView = new RealGrid.GridView(gridContainerRef.current);
                gridView.setDataSource(dataProvider);
                gridView.setColumns(columns);
                gridView.displayOptions.fitStyle = "evenFill";
                gridView.stateBar.visible = false; // 상태바(상태 아이콘) 숨김
                gridView.checkBar.visible = false; // 체크바(체크 아이콘) 숨김

                gridViewRef.current = gridView;
                dataProviderRef.current = dataProvider;

                gridView.onItemChecked = function (grid, checkedRow) {
                    // id 컬럼값 직접 얻기
                    const id = gridView.getValue(checkedRow, "id");
                    if (id === undefined) return;
                };
            }
        }
    }

    useEffect(() => {
        if (dataProviderRef.current && rowData) {
            dataProviderRef.current.setRows(rowData);
        }
    }, [rowData]);

    const gridContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div ref={gridContainerRef} id={containerId} style={{width: '100%', height: '100%'}}/>
        </div>
    );
};

export default ProductProcessRevisionGrid;

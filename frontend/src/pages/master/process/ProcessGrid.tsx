import React, {useEffect, useMemo, useRef} from "react";
import {RealGridReact} from "realgrid-react";
import * as RealGrid from "realgrid";

interface ItemGridProps {
    rowData: any[];
    processTypeOptions: { value: string; label: string }[];
    onSelectIds: (ids: number[]) => void;
    gridViewRef: React.MutableRefObject<any>;
    dataProviderRef: React.MutableRefObject<any>;
}

const ProcessGrid: React.FC<ItemGridProps> = ({
    rowData,
    processTypeOptions,
    onSelectIds,
    gridViewRef,
    dataProviderRef
}) => {
    useEffect(() => {
        let rafId: number;
        let el = gridContainerRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            if (gridViewRef.current) {
                return;
            }
            rafId = window.requestAnimationFrame(() => {
                if (processTypeOptions && processTypeOptions.length > 0) {
                    mountGridWhenReady();
                }
            });
            return () => {
                window.cancelAnimationFrame(rafId);
            };
        }
    }, [rowData, processTypeOptions, onSelectIds]);

    const mountGridWhenReady = () => {
        const el = gridContainerRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            if (!gridViewRef.current) {
                const fields = [
                    {fieldName: 'id', dataType: 'number'},
                    {fieldName: 'processCode'},
                    {fieldName: 'processName'},
                    {fieldName: 'processType', dataType: 'string'},
                    {fieldName: 'processOrder'},
                    {fieldName: 'isActive', dataType: 'boolean'},
                ];

                const columns = [
                    // {name: 'id', fieldName: 'id', header: 'ID', fillWidth: 60, editable: false},
                    {name: 'processCode', fieldName: 'processCode', header: '공정코드', fillWidth: 100, editable: false},
                    {name: 'processName', fieldName: 'processName', header: '공정명', fillWidth: 120},
                    {name: 'processType', fieldName: 'processType', header: '공정구분', fillWidth: 100,
                        displayCallback: function(grid, index, value) {
                            const option = processTypeOptions.find(o => o.value === value);
                            return option ? option.label : value;
                        },
                        editor: {
                            type: 'dropdown',
                            values: processTypeOptions.map(o => o.value),
                            labels: processTypeOptions.map(o => o.label)
                        }
                    },
                    // {name: 'processOrder', fieldName: 'processOrder', header: '공정순서', fillWidth: 100},
                    {
                        name: 'isActive',
                        fieldName: 'isActive',
                        header: '사용여부',
                        renderer: {
                            type: 'check',
                            trueValues: 'true',
                            falseValues: 'false'
                        },
                        width: 80,
                        editable: false
                    },
                ];
                const dataProvider = new RealGrid.LocalDataProvider(true);
                dataProvider.setFields(fields);
                dataProvider.setRows(rowData);

                const gridView = new RealGrid.GridView(gridContainerRef.current);
                gridView.setDataSource(dataProvider);
                gridView.setColumns(columns);
                gridView.displayOptions.fitStyle = "evenFill";
                gridView.stateBar.visible = false; // 상태바(상태 아이콘) 숨김

                gridViewRef.current = gridView;
                dataProviderRef.current = dataProvider;

                gridView.onItemChecked = function (grid, checkedRow) {
                    // id 컬럼값 직접 얻기
                    const id = gridView.getValue(checkedRow, "id");
                    if (id === undefined) return;

                    onSelectIds(prevSelected => {
                        if (prevSelected.includes(id)) {
                            return prevSelected.filter(_id => _id !== id);
                        } else {
                            return [...prevSelected, id];
                        }
                    });
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
            <div ref={gridContainerRef} id="realgrid-product-container" style={{width: '100%', height: '100%'}}/>
        </div>
    );
};

export default ProcessGrid;

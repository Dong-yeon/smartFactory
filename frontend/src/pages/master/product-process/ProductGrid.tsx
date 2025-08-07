import React, {useEffect, useMemo, useRef} from "react";
import {RealGridReact} from "realgrid-react";
import * as RealGrid from "realgrid";

interface ItemGridProps {
    rowData: any[];
    onSelectItem: (itemCode: string, item: any) => void;
    gridViewRef: React.MutableRefObject<any>;
    dataProviderRef: React.MutableRefObject<any>;
    itemTypeOptions: { value: string; label: string }[];
    itemUnitOptions: { value: string; label: string }[];
    containerId: string;
}

const ProductGrid: React.FC<ItemGridProps> = ({
    rowData,
    itemTypeOptions,
    itemUnitOptions,
    onSelectItem,
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
                if (itemTypeOptions && itemTypeOptions.length > 0 && itemUnitOptions && itemUnitOptions.length > 0) {
                    mountGridWhenReady();
                    gridViewRef.current.onCellClicked = function(grid, clickData) {
                        if (clickData.cellType === "data") {
                          const item = dataProviderRef.current.getJsonRow(clickData.dataRow);
                          onSelectItem && onSelectItem(item.itemCode, item); 
                        }
                      };
                }
            });
            return () => {
                window.cancelAnimationFrame(rafId);
            };
        }
    }, [rowData, itemTypeOptions, itemUnitOptions]);

    const mountGridWhenReady = () => {
        const el = gridContainerRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            if (!gridViewRef.current) {
                const fields = [
                    {fieldName: 'id', dataType: 'number'},
                    {fieldName: 'itemCode'},
                    {fieldName: 'itemName'},
                    {fieldName: 'itemType', dataType: 'string'},
                    {fieldName: 'spec'},
                    {fieldName: 'unit'},
                    {fieldName: 'safetyStock', dataType: 'number'},
                    {fieldName: 'description'},
                    {fieldName: 'isActive', dataType: 'boolean'},
                ];

                const columns = [
                    // {name: 'id', fieldName: 'id', header: 'ID', fillWidth: 60, editable: false},
                    {name: 'itemCode', fieldName: 'itemCode', header: '품목코드', fillWidth: 100, editable: false},
                    {name: 'itemName', fieldName: 'itemName', header: '품목명', fillWidth: 120, editable: false},
                    {name: 'itemType', fieldName: 'itemType', header: '품목구분', fillWidth: 100, editable: false,
                        displayCallback: function(grid, index, value) {
                            const option = itemTypeOptions.find(o => o.value === value);
                            return option ? option.label : value;
                        }
                    },
                    {name: 'spec', fieldName: 'spec', header: '규격/모델', fillWidth: 100, editable: false},
                    {name: 'unit', fieldName: 'unit', header: '단위', fillWidth: 60, editable: false,
                        displayCallback: function(grid, index, value) {
                            const option = itemUnitOptions.find(o => o.value === value);
                            return option ? option.label : value;
                        },
                    },
                    {name: 'safetyStock', fieldName: 'safetyStock', header: '안전재고', fillWidth: 120, editable: false},
                    // {name: 'description', fieldName: 'description', header: '비고', fillWidth: 120},
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
                gridView.checkBar.visible = false; // 체크바(체크 아이콘) 숨김

                gridViewRef.current = gridView;
                dataProviderRef.current = dataProvider;
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

export default ProductGrid;

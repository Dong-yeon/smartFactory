// Utility functions for product-process tree operations

export function findNodeById(treeData: any[], id: any): any | null {
    for (const node of treeData) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

export function addChildToTree(tree: any[], parentId: any, child: any): any[] {
    return tree.map(node => {
        if (node.id === parentId) {
            return {
                ...node,
                children: node.children ? [...node.children, child] : [child],
            };
        }
        if (node.children) {
            return {
                ...node,
                children: addChildToTree(node.children, parentId, child),
            };
        }
        return node;
    });
}

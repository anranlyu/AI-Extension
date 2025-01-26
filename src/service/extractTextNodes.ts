const extractTextNodes= (root: HTMLElement): Text[] =>{
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node: Node): number => {
                const parent = node.parentNode as HTMLElement;
                if (parent && ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "CODE"].includes(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }
    return textNodes;
}

export default extractTextNodes;

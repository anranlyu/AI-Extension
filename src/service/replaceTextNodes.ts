const replaceTextNodes = (textNodes: Text[], simplifiedTexts: string[]): void =>{
    if (textNodes.length !== simplifiedTexts.length) {
        console.error("Text node count does not match simplified text count.");
        return;
    }

    textNodes.forEach((node, index) => {
        node.nodeValue = simplifiedTexts[index];
    });
}

export default replaceTextNodes;


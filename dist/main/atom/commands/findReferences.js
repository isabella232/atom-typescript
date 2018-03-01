"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
const utils_1 = require("../utils");
const simpleSelectionView_1 = require("../views/simpleSelectionView");
const etch = require("etch");
const tsView_1 = require("../components/tsView");
const highlightComponent_1 = require("../views/highlightComponent");
registry_1.addCommand("atom-text-editor", "typescript:find-references", deps => ({
    description: "Find where symbol under text cursor is referenced",
    async didDispatch(e) {
        if (!utils_1.commandForTypeScript(e)) {
            return;
        }
        const location = utils_1.getFilePathPosition(e.currentTarget.getModel());
        if (!location) {
            e.abortKeyBinding();
            return;
        }
        const client = await deps.getClient(location.file);
        const result = await client.executeReferences(location);
        const res = await simpleSelectionView_1.selectListView({
            items: result.body.refs.map(r => (Object.assign({}, r, { file: atom.project.relativize(r.file) }))),
            itemTemplate: (item, ctx) => {
                return (etch.dom("li", null,
                    etch.dom(highlightComponent_1.HighlightComponent, { label: item.file, query: ctx.getFilterQuery() }),
                    etch.dom("div", { class: "pull-right" },
                        "line: $",
                        item.start.line),
                    etch.dom(tsView_1.TsView, { text: item.lineText.trim() })));
            },
            itemFilterKey: "file",
        });
        if (res) {
            atom.workspace.open(res.file, {
                initialLine: res.start.line - 1,
                initialColumn: res.start.offset - 1,
            });
        }
    },
}));
//# sourceMappingURL=findReferences.js.map
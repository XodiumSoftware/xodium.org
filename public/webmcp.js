(function () {
    const modelContext = navigator.modelContext;
    if (!modelContext) {
        return;
    }

    const register =
        typeof modelContext.registerTool === "function"
            ? modelContext.registerTool.bind(modelContext)
            : typeof modelContext.provideContext === "function"
              ? modelContext.provideContext.bind(modelContext)
              : null;

    if (!register) {
        return;
    }

    function init() {
        const controller = new AbortController();
        const signal = controller.signal;

        async function withMcpTools(fn) {
            if (!window.xodiumwebMcp) {
                await new Promise((resolve) => {
                    window.addEventListener("xodiumweb-mcp-ready", resolve, {
                        once: true,
                    });
                });
            }
            return fn(window.xodiumwebMcp);
        }

        register(
            {
                name: "navigate_to_section",
                description:
                    "Scroll the page to a major section (landing, projects, or team).",
                inputSchema: {
                    type: "object",
                    properties: {
                        section: {
                            type: "string",
                            enum: ["landing", "projects", "team"],
                            description: "The site section to scroll into view.",
                        },
                    },
                    required: ["section"],
                },
                execute: async ({ section }) => {
                    const id = section === "landing" ? "main-content" : section;
                    const el = document.getElementById(id);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                    }
                    return { success: !!el, section };
                },
            },
            { signal },
        );

        register(
            {
                name: "get_site_info",
                description:
                    "Return a short summary of Xodium and useful links.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
                execute: async () => ({
                    name: "Xodium Software",
                    description: "Open source CAD software organization.",
                    url: "https://xodium.org/",
                    github: "https://github.com/XodiumSoftware",
                    contact: "mailto:info@xodium.org",
                }),
            },
            { signal },
        );

        register(
            {
                name: "list_projects",
                description:
                    "List public GitHub repositories for XodiumSoftware.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 30,
                        },
                    },
                },
                execute: async ({ limit = 30 } = {}) => {
                    const projects = await withMcpTools((mcp) =>
                        mcp.listProjects(limit),
                    );
                    return projects;
                },
            },
            { signal },
        );

        register(
            {
                name: "list_team",
                description:
                    "List public members of the XodiumSoftware GitHub organization.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
                execute: async () => {
                    const members = await withMcpTools((mcp) =>
                        mcp.listTeam(),
                    );
                    return members;
                },
            },
            { signal },
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

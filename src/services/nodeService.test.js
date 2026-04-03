import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchNodes, createNode, updateNode, deleteNode } from "./nodeService";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockClear());

function mockResponse(body, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(body) });
}

describe("fetchNodes", () => {
  it("returns nodes on success", async () => {
    mockFetch.mockReturnValue(mockResponse([{ name: "A" }]));
    const nodes = await fetchNodes();
    expect(nodes).toEqual([{ name: "A" }]);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false));
    await expect(fetchNodes()).rejects.toThrow("Failed to fetch nodes");
  });
});

describe("createNode", () => {
  it("calls POST /data with node data", async () => {
    mockFetch.mockReturnValue(mockResponse({}));
    await createNode({ name: "B", description: "desc", parent: "A" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/data",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false));
    await expect(createNode({ name: "B" })).rejects.toThrow("Failed to add node");
  });
});

describe("updateNode", () => {
  it("calls PUT /data/:id", async () => {
    mockFetch.mockReturnValue(mockResponse({}));
    await updateNode("123", { name: "B", description: "updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/data/123",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false));
    await expect(updateNode("123", {})).rejects.toThrow("Failed to update node");
  });
});

describe("deleteNode", () => {
  it("calls DELETE /data/:id", async () => {
    mockFetch.mockReturnValue(mockResponse({}));
    await deleteNode("123");
    expect(mockFetch).toHaveBeenCalledWith(
      "/data/123",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false));
    await expect(deleteNode("123")).rejects.toThrow("Failed to delete node");
  });
});

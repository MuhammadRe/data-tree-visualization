const API = process.env.VUE_APP_API_URL || "";

export async function fetchNodes() {
  const res = await fetch(`${API}/data`);
  if (!res.ok) throw new Error("Failed to fetch nodes");
  return res.json();
}

export async function createNode(node) {
  const res = await fetch(`${API}/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(node),
  });
  if (!res.ok) throw new Error("Failed to add node");
}

export async function updateNode(id, node) {
  const res = await fetch(`${API}/data/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(node),
  });
  if (!res.ok) throw new Error("Failed to update node");
}

export async function deleteNode(id) {
  const res = await fetch(`${API}/data/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete node");
}

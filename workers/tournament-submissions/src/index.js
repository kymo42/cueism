export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const submission = {
          tournament: formData.get("tournament") || "",
          venue: formData.get("venue") || "",
          winner: formData.get("winner") || "",
          gameType: formData.get("gameType") || "",
          date: formData.get("date") || "",
          notes: formData.get("notes") || "",
          email: formData.get("email") || "",
          submittedAt: new Date().toISOString(),
          ip: request.headers.get("CF-Connecting-IP") || "unknown"
        };

        if (!submission.tournament || !submission.winner || !submission.venue) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" }
          });
        }

        const key = `submissions/${Date.now()}_${submission.winner.replace(/\s+/g, '_')}.json`;
        await env.SUBMISSIONS.put(key, JSON.stringify(submission, null, 2));

        let masterList = [];
        try {
          const existing = await env.SUBMISSIONS.get("master_list.json");
          if (existing) masterList = JSON.parse(await existing.text());
        } catch (e) {}
        masterList.push(submission);
        await env.SUBMISSIONS.put("master_list.json", JSON.stringify(masterList, null, 2));

        return new Response(JSON.stringify({ success: true, message: "Submission received!" }), {
          headers: { ...cors, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }
    }

    if (request.method === "GET") {
      const auth = request.headers.get("X-Auth-Token");
      if (auth !== env.ADMIN_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }
      try {
        const existing = await env.SUBMISSIONS.get("master_list.json");
        if (!existing) return new Response("[]", { headers: cors });
        return new Response(JSON.stringify(JSON.parse(await existing.text()), null, 2), {
          headers: { ...cors, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response("[]", { headers: cors });
      }
    }

    return new Response("Not found", { status: 404, headers: cors });
  }
};

import { describe, it, expect } from "vitest";
import { allowedTransitions, canTransition } from "@/lib/state-machine";
import type { UserRole, CandidateStatus } from "@/lib/types";

describe("State Machine — allowedTransitions", () => {
  describe("interviewer_1", () => {
    const role: UserRole = "interviewer_1";

    it("can call waiting → call_session_1", () => {
      expect(allowedTransitions(role, "waiting")).toContain("call_session_1");
    });

    it("can send session_1 → call_session_2", () => {
      expect(allowedTransitions(role, "session_1")).toContain("call_session_2");
    });

    it("cannot call from session_2", () => {
      expect(allowedTransitions(role, "session_2")).toEqual([]);
    });

    it("cannot decide pass/fail", () => {
      expect(allowedTransitions(role, "session_2")).not.toContain("passed");
      expect(allowedTransitions(role, "session_2")).not.toContain("failed");
    });

    it("cannot direct candidates (frontliner job)", () => {
      expect(allowedTransitions(role, "call_session_1")).toEqual([]);
    });
  });

  describe("frontliner", () => {
    const role: UserRole = "frontliner";

    it("can direct call_session_1 → session_1", () => {
      expect(allowedTransitions(role, "call_session_1")).toContain("session_1");
    });

    it("can direct call_session_2 → session_2", () => {
      expect(allowedTransitions(role, "call_session_2")).toContain("session_2");
    });

    it("can finish passed candidates", () => {
      expect(allowedTransitions(role, "passed")).toContain("finished");
    });

    it("can finish failed candidates", () => {
      expect(allowedTransitions(role, "failed")).toContain("finished");
    });

    it("cannot call candidates (interviewer job)", () => {
      expect(allowedTransitions(role, "waiting")).toEqual([]);
    });

    it("cannot decide pass/fail (owner job)", () => {
      expect(allowedTransitions(role, "session_2")).toEqual([]);
    });
  });

  describe("owner", () => {
    const role: UserRole = "owner";

    it("can pass from session_2", () => {
      expect(allowedTransitions(role, "session_2")).toContain("passed");
    });

    it("can fail from session_2", () => {
      expect(allowedTransitions(role, "session_2")).toContain("failed");
    });

    it("cannot decide from waiting", () => {
      expect(allowedTransitions(role, "waiting")).toEqual([]);
    });

    it("cannot call from waiting (interviewer job)", () => {
      expect(allowedTransitions(role, "waiting")).toEqual([]);
    });
  });

  describe("admin_hr", () => {
    const role: UserRole = "admin_hr";

    it("can transition anywhere from waiting", () => {
      const allowed = allowedTransitions(role, "waiting");
      expect(allowed).toContain("call_session_1");
      expect(allowed).toContain("session_1");
      expect(allowed).toContain("passed");
      expect(allowed).toContain("failed");
    });

    it("can finish from passed", () => {
      expect(allowedTransitions(role, "passed")).toContain("finished");
    });
  });
});

describe("State Machine — canTransition", () => {
  it("returns true for valid transitions", () => {
    expect(canTransition("interviewer_1", "waiting", "call_session_1")).toBe(true);
    expect(canTransition("owner", "session_2", "passed")).toBe(true);
    expect(canTransition("frontliner", "call_session_1", "session_1")).toBe(true);
  });

  it("returns false for invalid transitions", () => {
    expect(canTransition("frontliner", "waiting", "call_session_1")).toBe(false);
    expect(canTransition("interviewer_1", "session_2", "passed")).toBe(false);
    expect(canTransition("owner", "waiting", "call_session_1")).toBe(false);
  });
});

describe("State Machine — full flow simulation", () => {
  it("completes the happy path: waiting → called → session1 → called → session2 → passed → finished", () => {
    const steps: [UserRole, CandidateStatus, CandidateStatus][] = [
      ["interviewer_1", "waiting", "call_session_1"],
      ["frontliner", "call_session_1", "session_1"],
      ["interviewer_1", "session_1", "call_session_2"],
      ["frontliner", "call_session_2", "session_2"],
      ["owner", "session_2", "passed"],
      ["frontliner", "passed", "finished"],
    ];

    for (const [role, from, to] of steps) {
      expect(
        canTransition(role, from, to),
        `${role} should be able to transition ${from} → ${to}`
      ).toBe(true);
    }
  });
});

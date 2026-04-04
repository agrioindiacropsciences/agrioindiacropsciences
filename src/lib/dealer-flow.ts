import type { Distributor, User } from "@/lib/api/types";

export type DealerFlowTarget =
  | "farmer-dashboard"
  | "dealer-onboarding"
  | "dealer-review"
  | "dealer-home";

export function getDealerFlowTarget(
  user: User | null | undefined,
  distributorProfile: Distributor | null | undefined,
): DealerFlowTarget {
  if (!user || user.role !== "DEALER") {
    return "farmer-dashboard";
  }

  if (!distributorProfile) {
    return "dealer-onboarding";
  }

  switch (distributorProfile.verification_status) {
    case "APPROVED":
      return "dealer-home";
    case "PENDING":
      return "dealer-review";
    case "REJECTED":
    default:
      return "dealer-onboarding";
  }
}

export function getDealerFlowPath(
  user: User | null | undefined,
  distributorProfile: Distributor | null | undefined,
): string {
  switch (getDealerFlowTarget(user, distributorProfile)) {
    case "dealer-onboarding":
      return "/dashboard/profile/distributor";
    case "dealer-review":
      return "/dashboard/dealer/review";
    case "dealer-home":
      return "/dashboard/dealer";
    case "farmer-dashboard":
    default:
      return "/dashboard";
  }
}

export function isAllowedDealerPath(
  pathname: string,
  user: User | null | undefined,
  distributorProfile: Distributor | null | undefined,
): boolean {
  if (!user || user.role !== "DEALER") {
    return true;
  }

  const flowPath = getDealerFlowPath(user, distributorProfile);
  const sharedPaths = new Set([
    "/dashboard/profile",
    "/dashboard/profile/distributor",
    "/dashboard/support",
  ]);

  if (sharedPaths.has(pathname)) {
    return true;
  }

  return pathname === flowPath;
}

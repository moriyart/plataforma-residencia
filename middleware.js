import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Aqui você define quais páginas são públicas. 
  // Geralmente deixamos apenas a Home ou Landing Page pública.
  publicRoutes: ["/"] 
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
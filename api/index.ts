import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware for /api routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
    const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

        const originalResJson = res.json;
          res.json = function (bodyJson: any, ...args: any[]) {
              capturedJsonResponse = bodyJson;
                  return originalResJson.apply(res, [bodyJson, ...args]);
                    };

                      res.on("finish", () => {
                          const duration = Date.now() - start;
                              if (path.startsWith("/api")) {
                                    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                                          if (capturedJsonResponse) {
                                                  logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                                                        }
                                                              if (logLine.length > 80) {
                                                                      logLine = logLine.slice(0, 79) + "...";
                                                                            }
                                                                                  console.log(logLine);
                                                                                      }
                                                                                        });

                                                                                          next();
                                                                                          });

                                                                                          // Register all API routes (adds routes to app, returns http server we don't need here)
                                                                                          registerRoutes(app).catch((err) => {
                                                                                            console.error("Failed to register routes:", err);
                                                                                            });

                                                                                            // Global error handler
                                                                                            app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
                                                                                              const status = err.status || err.statusCode || 500;
                                                                                                const message = err.message || "Internal Server Error";
                                                                                                  res.status(status).json({ message });
                                                                                                  });

                                                                                                  // Export the Express app as the default Vercel serverless handler
                                                                                                  export default app;

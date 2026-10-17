export function validateRequest(req: any, res: any, next: (error?: unknown) => void): void {
  if (req.body !== undefined && (!req.body || typeof req.body !== "object" || Array.isArray(req.body))) {
    res.status(400).json({ error: "Request body must be a JSON object" });
    return;
  }
  for (const [name, value] of Object.entries(req.params ?? {})) {
    if (/(^id$|Id$)/i.test(name) && (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)))) {
      res.status(400).json({ error: `Invalid ${name}` });
      return;
    }
  }
  next();
}

export function catchAsync(handler: (req: any, res: any, next: (error?: unknown) => void) => unknown) {
  return (req: any, res: any, next: (error?: unknown) => void) => {
    try {
      Promise.resolve(handler(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
}

export default function professorMiddleware(req, res, next) {
    if (!req.user.professor) {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas professores podem acessar esta rota.'
        });
    }
    next();
}
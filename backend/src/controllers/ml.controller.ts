import { Request, Response } from 'express';
import { PythonShell, Options } from 'python-shell';
import path from 'path';

export const getPrediction = (req: Request, res: Response): void => {
    const inputData = req.body;

    const options: Options = {
        mode: 'json',
        pythonOptions: ['-u'],
        scriptPath: path.resolve(__dirname, '../ml'),
        args: [JSON.stringify(inputData)],
    };

    PythonShell.run('predict.py', options)
        .then((results: any[] | undefined) => {
            if (!results || results.length === 0) {
                res.status(500).json({ error: 'No result returned from Python script' });
                return;
            }
            res.json(results[0]);
        })
        .catch((err: Error) => {
            console.error('Python error:', err);
            res.status(500).json({ error: err.message });
        });
};

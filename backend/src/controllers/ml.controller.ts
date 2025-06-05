import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const runPythonScript = (scriptName: string, inputData: object): Promise<any> => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml', scriptName);
        const python = spawn('python', [scriptPath, JSON.stringify(inputData)]);

        let data = '';
        let error = '';

        python.stdout.on('data', (chunk) => {
            data += chunk.toString();
        });

        python.stderr.on('data', (chunk) => {
            error += chunk.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject('Failed to parse Python response');
                }
            } else {
                reject(error);
            }
        });
    });
};

export const predictCrop = async (req: Request, res: Response) => {
    try {
        const result = await runPythonScript('predict_crop.py', req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const recommendFertilizer = async (req: Request, res: Response) => {
    try {
        const result = await runPythonScript('recommend_fertilizer.py', req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const estimateYield = async (req: Request, res: Response) => {
    try {
        const result = await runPythonScript('estimate_yield.py', req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};
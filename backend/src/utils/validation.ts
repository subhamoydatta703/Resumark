import { z } from "zod";

export const ResumeStatusSchema = z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
]);


export const AnalysisResultSchema = z.object({
    candidateInfo: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
        location: z.string().nullable(),
        linkedin: z.string().optional().nullable(),
    }),
    summary: z.string().nullable(),
    skills: z.array(z.string()).or(
        z.array(
            z.object({
                category: z.string(),
                items: z.array(z.string())
            })
        )
    ).nullable(),
    strengths: z.array(z.string()).nullable(),
    improvements: z.array(z.string()).nullable(),
    overallScore: z.number().int().min(0).max(100),
    atsScore: z.number().int().min(0).max(100),
    formattingScore: z.number().int().min(0).max(100),
    suggestedRoles: z.array(z.string()).nullable(),

});


export const UserSchema = z.object({
    id: z.string().min(1, "User id is required"),
    email: z.string().email("Invalid email format"),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});

export const CreatedUserSchema = UserSchema.pick({
    id: true,
    email: true,
})


export const ResumeSchema = z.object({
    id: z.string().cuid().optional(),
    fileName: z.string().min(1, "File name is required"),
    originalName: z.string().min(1, "Original name is required"),
    s3Key: z.string().min(1, "S3 key is required"),
    status: ResumeStatusSchema.default("PENDING"),
    analysisResult: AnalysisResultSchema.nullable().optional(),
    userId: z.string().min(1, "Owner user id is required"),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const CreateResumeSchema = ResumeSchema.pick({
    fileName: true,
    originalName: true,
    s3Key: true,
    userId: true,
})
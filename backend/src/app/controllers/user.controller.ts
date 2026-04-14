import { Request, Response, NextFunction } from "express";
import { createUser, getAllUsers, updateUserRole, deactivateUser } from "../services/user.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, message: "User created successfully", data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, message: "Users retrieved", data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await updateUserRole(id, req.body.role);
    res.status(200).json({ success: true, message: "User role updated", data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await deactivateUser(id);
    res.status(200).json({ success: true, message: "User deactivated", data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

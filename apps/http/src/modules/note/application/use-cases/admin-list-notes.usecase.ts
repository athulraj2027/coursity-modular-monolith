import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteFilterParams, PaginatedNotesResult } from "../../domain/dtos/note.dto";
import { NoteEntity } from "../../domain/entities/note.entity";

export class AdminListNotesUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(params: NoteFilterParams): Promise<PaginatedNotesResult<NoteEntity>> {
    return this.noteRepo.findManyAdmin(params);
  }
}

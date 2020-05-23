import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Comment } from '../models/comment'
import { environment } from 'src/environments/environment';
import {first} from "rxjs/operators";
import {Project} from "../models/project";

@Injectable({  providedIn: 'root' })
export class CommentService {

  urlProject: string = "";
  urlCommentById: string = "";

  constructor(private httpClient : HttpClient) {

    //     router.route('/project/:projectId/comment')
    //   .get(auth, projectController.multipleComments)
    //   .post(auth, projectController.createComment);
    //
    // router.route('/project/:projectId/comment/:commentId')
    //   .put(auth, projectController.updateComment)
    //   .delete(auth, projectController.deleteComment);

    this.urlProject =  environment.apiUrl + '/project';
    this.urlCommentById = '/comment';

   }


  getAllCommentsOfProject(idProject: number) {
    return this.httpClient.get<Comment[]>(this.urlProject + `/${idProject}` + this.urlCommentById );
  }

  addCommentToProject(idProject: number, comment: Comment) {
    return this.httpClient.post(this.urlProject + `/${idProject}` + this.urlCommentById, comment);
  }

  deleteComment(idProject: number, idComment: number) {
    return this.httpClient.delete(this.urlProject + `/${idProject}` + this.urlCommentById + `/${idComment}`);
  }


}

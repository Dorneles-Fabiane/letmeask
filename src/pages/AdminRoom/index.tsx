import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { database } from '../../services/firebase';

import { Button } from '../../components/Button/index';
import { RoomCode } from '../../components/RoomCode/index';
import { Question } from '../../components/Question/index';
import { DeleteModal } from '../../components/DeleteModal/index';

import { useRoom } from '../../hooks/useRoom';
//import { useAuth } from '../../hooks/useAuth';

import logoImg from '../../assets/images/logo.svg';
import deleteImg from '../../assets/images/delete.svg';
import checkImg from '../../assets/images/check.svg';
import answerImg from '../../assets/images/answer.svg';

import './style.scss';

type RoomParams = {
   id: string;
}

export function AdminRoom() {
   //const { user } = useAuth();

   const params = useParams<RoomParams>();
   const history = useHistory();

   const roomId = params.id;
   const { questions, title } = useRoom(roomId);

   const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

   async function handleEndRoom() {
      await database.ref(`rooms/${roomId}`).update({
         endedAt: new Date(),
      });

      history.push('/');
   }

   async function handleDeleteQuestion(questionId: string) {
      if (window.confirm('Tem certeza que você deseja excluir essa pergunta?')) {
         await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
      }
   }

   async function handleCheckeQuestionAsAnswered(questionId: string) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
         isAnswered: true,
      });
   }

   async function handleHighlightQuestion(questionId: string) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
         isHighlighted: true,
      });
   }

   function handleOpenDeleteModal() {
      setDeleteModalIsOpen(true);
   }

   function handleCloseDeleteModal() {
      setDeleteModalIsOpen(false);
   }

   return (
      <>
         <div id="page-room">
            <header>
               <div id="admin" className="content">
                  <img src={logoImg} alt="letMeAsk" />
                  <div>
                     <RoomCode code={roomId} />
                     <Button isOutlined onClick={handleEndRoom}>
                        Encerrar sala
                     </Button>
                  </div>
               </div>
            </header>

            <main>
               <div className="room-title">
                  <h1>Sala {title}</h1>
                  {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
               </div>

               <div className="question-list">
                  {questions.map(question => {
                     return (
                        <Question
                           key={question.id}
                           content={question.content}
                           author={question.author}
                           isAnswered={question.isAnswered}
                           isHighlighted={question.isHighlighted}
                        >
                           {!question.isAnswered && (
                              <>
                                 <button
                                    type="button"
                                    onClick={() => handleCheckeQuestionAsAnswered(question.id)}
                                 >
                                    <img src={checkImg} alt="Marcar pergunta como respondida" />
                                 </button>

                                 <button
                                    type="button"
                                    onClick={() => handleHighlightQuestion(question.id)}
                                 >
                                    <img src={answerImg} alt="Dar destaque à pergunta" />
                                 </button>
                              </>
                           )}

                           <button
                              type="button"
                              onClick={handleOpenDeleteModal}
                           //onClick={() => handleDeleteQuestion(question.id)}
                           >
                              <img src={deleteImg} alt="Remover pergunta" />
                           </button>
                        </Question>
                     );
                  })}
               </div>
            </main>
         </div>
         <DeleteModal
            isOpen={deleteModalIsOpen}
            onRequestClose={handleCloseDeleteModal}
         />
      </>
   );
}
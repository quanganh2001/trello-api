/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án...vv
    // Bản email, notification về cho admin khi có 1 cái board mới được tạo...vv

    // Trả kết quả về, trong Services luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // B1: Deep Clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu, tùy mục đích về sau mà có cần clone deep hay không. (video số 63 sẽ giải thích)
    // https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)

    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // Cách khác đơn giản là convert ObjectId về string bằng hàm toString của JavaScript
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // B3: Xóa mảng cards khởi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails
}

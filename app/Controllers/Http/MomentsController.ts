import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Moment from 'App/Models/Moment'

export default class MomentsController {
  private validationOptions = {
    type: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    const body = request.body()
    const image = request.file('image', this.validationOptions)

    if (image) {
      await image.moveToDisk('./')
      body.image = image.fileName
    }

    const moment = await Moment.create(body)

    response.status(201)

    return {
      message: 'Moment successfully created!',
      data: moment,
    }
  }

  public async index() {
    const moments = await Moment.query().preload('comments')
    return { data: moments }
  }

  public async show({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.load('comments')

    return {
      data: moment,
    }
  }

  public async destroy({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.delete()

    return {
      message: 'Moment successfully deleted!',
    }
  }

  public async update({ request, params }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.findOrFail(params.id)

    if (!moment.image || moment.image !== body.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        await image.moveToDisk('./')

        if (image.fileName) {
          await Drive.delete(moment.image)
          moment.image = image.fileName
        }
      }
    }

    moment.title = body.title
    moment.description = body.description

    await moment.save()

    return {
      message: 'Moment successfully updated!',
      data: moment,
    }
  }
}

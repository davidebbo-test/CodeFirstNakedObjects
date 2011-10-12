using NakedObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CodeFirstExample
{
    /// <summary>
    /// 
    /// </summary>
    public class Order
    {
        [Hidden]
        public virtual int Id { get; set; }

       [Disabled]
        public virtual Customer Customer { get; set; }

       [Title, Mask("d")]
       public virtual DateTime Date { get; set; }

       #region Lines (collection)
       private ICollection<OrderLine> _Lines = new List<OrderLine>();

       public virtual ICollection<OrderLine> Lines
       {
           get
           {
               return _Lines;
           }
           set
           {
               _Lines = value;
           }
       }

       public void AddToLines(OrderLine value)
       {
           if (!(_Lines.Contains(value)))
           {
               _Lines.Add(value);
           }
       }

       public void RemoveFromLines(OrderLine value)
       {
           if (_Lines.Contains(value))
           {
               _Lines.Remove(value);
           }
       }

       public IList<OrderLine> ChoicesRemoveFromLines(OrderLine value)
       {
           return _Lines.ToList();
       }
       #endregion

       public IDomainObjectContainer Container { set; protected get; }

       public OrderLine AddNewLine()
       {
           var line = Container.NewTransientInstance<OrderLine>();
           line.Order = this;
           return line;
       }
    }
}

using NakedObjects;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;

namespace CodeFirstExample
{
    /// <summary>
    /// 
    /// </summary>
    public class Customer
    {
        [Hidden]
        public virtual int Id { get; set; }

        [StringLength(50), Title]
        public virtual string Name { get; set; }

        #region Orders (collection)
        private ICollection<Order> _Orders = new List<Order>();

        public virtual ICollection<Order> Orders
        {
            get
            {
                return _Orders;
            }
            set
            {
                _Orders = value;
            }
        }

        public void AddToOrders(Order value)
        {
            if (!(_Orders.Contains(value)))
            {
                _Orders.Add(value);
            }
        }

        public void RemoveFromOrders(Order value)
        {
            if (_Orders.Contains(value))
            {
                _Orders.Remove(value);
            }
        }

        public IList<Order> ChoicesRemoveFromOrders(Order value)
        {
            return _Orders.ToList();
        }
        #endregion

        public Order CreateNewOrder()
        {
            var order = Container.NewTransientInstance<Order>();
            order.Customer = this;
            return order;
        }

        public IDomainObjectContainer Container { set; protected get; }

    }
}
